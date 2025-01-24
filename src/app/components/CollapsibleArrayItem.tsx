import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CollapsibleArrayItemProps {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  item: any;
}

export const CollapsibleArrayItem: React.FC<CollapsibleArrayItemProps> = ({
  item,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-md mb-2">
      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          {isOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <span>{item.name || item.id || "Item"}</span>
        </div>
      </button>
      {isOpen && (
        <div className="p-3 border-t bg-gray-50">
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(item, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
