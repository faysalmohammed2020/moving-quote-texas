"use client";

const TagList = () => {
  return (
    <div>
      {" "}
      <div className="h-14 col-span-2 p-4">
        <h2 className="text-xl font-semibold mb-4">Tags</h2>
        <div className="flex flex-wrap gap-2">
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
            Moving Expenses
          </span>
          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
            Tax Benefits
          </span>
          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
            Relocation Tips
          </span>
          <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm">
            Property Taxes
          </span>
          <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm">
            Moving Checklist
          </span>
        </div>
      </div>
    </div>
  );
};

export default TagList;
