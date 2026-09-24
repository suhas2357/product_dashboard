import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';


const CARDS = [
  {
    to: '/products',
    title: 'Browse Products',
    description: 'View, search, filter and sort all products.',
  },
  {
    to: '/products/new',
    title: 'Add New Product',
    description: 'Create a new product entry.',
  },
];


const DashboardCard = memo(({ to, title, description }) => (
  <Link
    to={to}
    className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  >
    <h2 className="font-semibold text-gray-800">{title}</h2>
    <p className="text-sm text-gray-500 mt-1">{description}</p>
  </Link>
));

const Dashboard = () => {
  const { user } = useAuth();


  const greeting = useMemo(() => {
    if (!user) return 'Welcome!';
    return `Welcome back, ${user.firstName || user.username}!`;
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      <p className="text-gray-500 mt-1">{greeting}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {CARDS.map((card) => (
          <DashboardCard
            key={card.to}
            to={card.to}
            title={card.title}
            description={card.description}
          />
        ))}
      </div>
    </div>
  );
};


export default memo(Dashboard);