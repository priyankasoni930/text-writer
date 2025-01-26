import MultiPageEditor from "@/components/MultiPageEditor";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-0">
            <span className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-full font-bold text-gray-600 dark:text-gray-400 mb-2 inline-block">
              Text Writer
            </span>
          </div>
          <MultiPageEditor />
        </div>
      </div>
    </div>
  );
};

export default Index;
