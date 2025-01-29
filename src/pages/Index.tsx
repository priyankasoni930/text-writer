import MultiPageEditor from "@/components/MultiPageEditor";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <MultiPageEditor />
        </div>
      </div>
    </div>
  );
};

export default Index;
