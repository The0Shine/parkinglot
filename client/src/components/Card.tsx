interface ICardProps {
  name: string;
  empty: boolean;
}
import "./Card.css";
export const Card = ({ name, empty }: ICardProps) => {
  return (
    <div className={`card ${empty ? "card-empty" : "card-full"}`}>
      <h1 className="card-title">{name}</h1>
    </div>
  );
};
