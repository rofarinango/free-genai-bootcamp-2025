import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="container mx-auto px-6 py-3">
      <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        <li>
          <Link
            to="/"
            className="hover:text-gray-900 dark:hover:text-gray-100"
          >
            Home
          </Link>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          return (
            <li key={name} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-2" />
              {isLast ? (
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')}
                </span>
              ) : (
                <Link
                  to={routeTo}
                  className="hover:text-gray-900 dark:hover:text-gray-100"
                >
                  {name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
} 