import Sidebar from './Sidebar';

export default function MobileNavigation({ open, onClose }) {
  return (
    <div className={`lg:hidden fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      <div
        className={`fixed inset-0 bg-ink/40 backdrop-blur-sm transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-navy shadow-popover transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onNavigate={onClose} />
      </div>
    </div>
  );
}
