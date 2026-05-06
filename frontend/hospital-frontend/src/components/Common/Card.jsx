const Card = ({ children, title }) => (
  <div className="bg-white rounded-lg shadow p-6">
    {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
    {children}
  </div>
);

export default Card;