import { Fragment } from 'react';
import { ChevronRight, Home as HomeIcon } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onHome?: () => void;
}

export const Breadcrumbs = ({ items, onHome }: BreadcrumbsProps) => {
  return (
    <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      <button
        onClick={onHome}
        className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors"
      >
        <HomeIcon size={16} />
        <span>Home</span>
      </button>
      
      {items.map((item, idx) => (
        <Fragment key={idx}>
          <ChevronRight size={16} className="text-slate-400/50" />
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="text-slate-400 hover:text-amber-400 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-slate-400">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
};
