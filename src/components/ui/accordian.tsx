/* components/ui/accordion.tsx */

import React from "react";

interface AccordionContextType {
  activeItem: string | null;
  setActiveItem: (value: string | null) => void;
}

const AccordionContext = React.createContext<AccordionContextType | undefined>(undefined);

interface AccordionProps {
  type?: "single" | "multiple";
  collapsible?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Accordion({ 
  type = "single", 
  collapsible = false, 
  children,
  className = "" 
}: AccordionProps) {
  const [activeItem, setActiveItem] = React.useState<string | null>(null);

  return (
    <AccordionContext.Provider value={{ activeItem, setActiveItem }}>
      <div className={className}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function AccordionItem({ 
  value, 
  children,
  className = "" 
}: AccordionItemProps) {
  return (
    <div className={`border rounded-lg mb-2 ${className}`}>
      {children}
    </div>
  );
}

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionTrigger({ 
  children,
  className = "" 
}: AccordionTriggerProps) {
  const context = React.useContext(AccordionContext);
  const itemRef = React.useRef<HTMLButtonElement>(null);

  if (!context) {
    throw new Error('AccordionTrigger must be used within an Accordion');
  }

  const { activeItem, setActiveItem } = context;
  const parentValue = itemRef.current?.parentElement?.getAttribute('data-value') || null;
  const isActive = activeItem === parentValue;

  const handleClick = () => {
    if (parentValue) {
      setActiveItem(isActive ? null : parentValue);
    }
  };

  return (
    <button
      ref={itemRef}
      onClick={handleClick}
      className={`flex justify-between w-full p-4 text-left font-medium ${className}`}
      aria-expanded={isActive}
    >
      {children}
      <span className="transform transition-transform duration-200 ml-2">
        {isActive ? '−' : '+'}
      </span>
    </button>
  );
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionContent({ 
  children,
  className = "" 
}: AccordionContentProps) {
  const context = React.useContext(AccordionContext);
  const contentRef = React.useRef<HTMLDivElement>(null);

  if (!context) {
    throw new Error('AccordionContent must be used within an Accordion');
  }

  const { activeItem } = context;
  const parentValue = contentRef.current?.parentElement?.getAttribute('data-value') || null;
  const isActive = activeItem === parentValue;

  return (
    <div
      ref={contentRef}
      className={`overflow-hidden transition-all duration-200 ${isActive ? 'max-h-screen' : 'max-h-0'} ${className}`}
    >
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}