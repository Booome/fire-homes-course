import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { PlusCircleIcon, XIcon } from "lucide-react";
import { useRef } from "react";
import { PropertyImage } from "./PropertyImage";
import { Skeleton } from "./ui/skeleton";

export function MultiPictureSelector({
  value,
  onChange,
  className,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}) {
  const handleAdd = (files: string[]) => {
    onChange([...(value || []), ...files]);
  };

  const handleDelete = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(value);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange(items);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="droppable" direction="horizontal">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex flex-row flex-wrap justify-center gap-4",
              className
            )}
          >
            {value.map((url, index) => (
              <Draggable key={url} draggableId={url} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <SelectedImage
                      url={url}
                      onDelete={() => {
                        handleDelete(index);
                      }}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            <AddImageButton onAdd={handleAdd} />
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

function SelectedImage({
  url,
  onDelete,
}: {
  url: string;
  onDelete: () => void;
}) {
  return url ? (
    <div className="relative group">
      <PropertyImage
        className="rounded-lg object-cover w-40 h-40 shadow-lg"
        src={url}
        width={160}
        height={160}
        alt="Property image"
      />
      <XIcon
        className="absolute top-2 right-2 w-5 h-5 text-red-500 font-bold bg-white rounded-full shadow opacity-0 group-hover:opacity-100 hover:cursor-pointer"
        onClick={onDelete}
      />
    </div>
  ) : (
    <Skeleton className="w-40 h-40 rounded-lg" />
  );
}

function AddImageButton({ onAdd }: { onAdd: (value: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative w-40 h-40 rounded-lg overflow-hidden">
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
        <PlusCircleIcon className="w-10 h-10 text-gray-900" />
      </div>
      <Input
        ref={inputRef}
        type="file"
        className="absolute opacity-0 inset-0 w-full h-full cursor-pointer"
        multiple
        accept="image/*"
        title="Add Picture"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          onAdd(files.map((file) => URL.createObjectURL(file)));
          if (inputRef.current) {
            inputRef.current.value = "";
          }
        }}
      />
    </div>
  );
}
