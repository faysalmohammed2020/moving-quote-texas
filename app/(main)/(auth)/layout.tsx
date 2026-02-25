const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid h-screen place-items-center px-4 py-8">
      <main className="flex w-full max-w-sm flex-col gap-8">
       
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
