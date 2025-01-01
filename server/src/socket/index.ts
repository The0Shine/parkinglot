import { Server as HttpServer } from 'http'

import { Server } from 'socket.io'
import Card from '~/models/cards.model'
import Log from '~/models/logs.model'
import Slot from '~/models/slots.model'
import User from '~/models/users.model'
import Warning from '~/models/warnings.model'
import { getBill } from '~/utils/common'

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
  })

  io.on('connection', async (socket) => {
    const admin = socket.handshake.query.admin === 'true'
    if (admin) {
      socket.join('admin')
      console.log('Admin connection!')
    } else {
      socket.join('client')
      console.log('Client connection!')
    }

    socket.on('connect_error', (err) => {
      console.log('Connection error:', err.message)
    })

    socket.on('disconnect', (reason) => {
      if (admin) socket.leave('admin')
      else socket.leave('client')
      console.log(`User disconnected: ${reason}`)
    })
    socket.on('check-in', async (data) => {
      const { uid, plate } = data

      const card = await Card.findOne({ uid })

      if (!card) {
        const warning = await Warning.create({
          desc: `Card invalid`
        })
        io.to('admin').emit('warning', warning)
        return socket.emit('invalid-check-in-card')
      }

      // Kiểm tra log chưa thanh toán
      const existingLog = await Log.findOne({ cardId: card._id, paid: false })

      if (existingLog) {
        // Ghi cảnh báo nếu thẻ đang sử dụng
        const warning = await Warning.create({
          cardId: card._id,
          desc: `Card ${uid} is duplicated! Check now!`
        })

        // Gửi cảnh báo tới client
        io.to('admin').emit('warning', warning)
        return socket.emit('check-in-card-in-use')
      }
      if (card.type === 'monthly') {
        const exituser = await User.findOne({ cardId: card._id })
        if (!exituser) {
          socket.emit('user-not-found')
          const warning = await Warning.create({ cardId: card._id, desc: `User not found` })
          io.to('admin').emit('warning', warning)
        } else {
          await Log.create({ cardId: card._id, paid: false, licensePlate: plate, userId: exituser._id })
          socket.emit('check-in-user-success', {
            name: exituser.name // Gửi tên người dùng
          })
          io.to('admin').emit('new-log')
        }
      } else {
        await Log.create({ cardId: card._id, paid: false, licensePlate: plate })
        socket.emit('check-in-success')
        io.to('admin').emit('new-log')
      }
    })

    socket.on('check-out', async (data) => {
      const { uid, plate } = data

      console.log('Received UID:', uid)
      console.log(plate)

      // Tìm thẻ trong cơ sở dữ liệu
      const card = await Card.findOne({ uid })

      if (!card) {
        const warning = await Warning.create({
          desc: `Card invalid`
        })
        io.to('admin').emit('warning', warning)
        return socket.emit('invalid-check-out-card')
      }

      // Kiểm tra log chưa thanh toán
      const existingLog = await Log.findOne({ cardId: card._id, paid: false })

      if (existingLog) {
        const plateLog = existingLog.licensePlate
        if (plateLog.toLocaleLowerCase() !== plate.toLocaleLowerCase()) {
          const warning = await Warning.create({
            cardId: card._id,
            desc: `False liscensePlate `
          })
          io.to('admin').emit('warning', warning)
          socket.emit('check-out-false-license-plate')
        } else {
          const bill = getBill(existingLog.createdAt!.toISOString())
          if (card.type === 'monthly') {
            const existingUser = await User.findOne({ cardId: card._id })
            if (!existingUser) {
              const warning = await Warning.create({ cardId: card._id, desc: `User not found` })
              io.to('admin').emit('warning', warning)
              socket.emit('user-not-found')
            } else {
              await Log.updateOne({ _id: existingLog._id, userId: existingUser._id }, { $set: { paid: true } })
              io.to('admin').emit('new-log')
              socket.emit('check-out-user-success', { name: existingUser.name })
            }
          } else {
            socket.emit('check-out-success', { bill: bill })
            io.to('admin').emit('new-log')
            await Log.updateOne({ _id: existingLog._id }, { $set: { paid: true, bill: bill } })
          }
        }
        // Ghi cảnh báo nếu thẻ đang sử dụng

        // Gửi cảnh báo tới client
      } else {
        const warning = await Warning.create({
          cardId: card._id,
          desc: `Card ${uid} is not in use`
        })
        io.to('admin').emit('warning', warning)
        socket.emit('check-out-card-not-in-use')
      }
    })
    socket.on('update-slot', async (data) => {
      const { slot } = data
      console.log(slot)

      for (let i = 0; i < slot.length; i++) {
        const isEmpty = slot[i] === '1' // 1 là trống, 0 là có người

        // Tìm và cập nhật trạng thái slot theo số thứ tự (number: i + 1)
        await Slot.findOneAndUpdate(
          { number: i + 1 },
          { empty: isEmpty },
          { upsert: true, new: true } // Tự động tạo mới nếu không tìm thấy
        )
      }
      io.to('admin').emit('update-slot-ui')
    })
    socket.on('open-in', () => io.to('admin').emit('open-gate-in'))
    socket.on('open-out', () => io.to('admin').emit('open-gate-out'))
    socket.on('close-out', () => io.to('admin').emit('close-gate-out'))
    socket.on('close-in', () => io.to('admin').emit('close-gate-in'))
  })
}
