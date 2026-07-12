export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-[#f2ece5] px-[22px] py-16">
      <div className="w-full max-w-[400px] rounded-2xl border border-[#e4d9cf] bg-[#faf6f1] p-8">
        {children}
      </div>
    </div>
  );
}
