import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  onRedirectToLogin: () => void;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  isAuthenticated,
  onRedirectToLogin,
}) => {
  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 font-bold text-xl">
            🔒
          </div>
          <h2 className="text-lg font-black text-slate-900">Admin Access Required</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            You must be logged in with administrative credentials to access the NITW Campus Navigator control center.
          </p>
          <button
            onClick={onRedirectToLogin}
            className="mt-6 w-full py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
