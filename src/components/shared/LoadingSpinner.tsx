export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-3 border-maroon-200 border-t-maroon-600 rounded-full animate-spin" />
    </div>
  );
}
