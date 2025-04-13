import * as React from "react";

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  className?: string;
}
const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className = "", ...props }, ref) => (
    <div className="w-full table-auto">
      <table
        ref={ref}
        className={`w-full table-auto ${className}`}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}
const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className = "", ...props }, ref) => (
    <thead ref={ref} className={`${className}`} {...props} />
  )
);
TableHeader.displayName = "TableHeader";

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}
const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className = "", ...props }, ref) => (
    <tbody ref={ref} className={`${className}`} {...props} />
  )
);
TableBody.displayName = "TableBody";

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  className?: string;
}
const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className = "", ...props }, ref) => (
    <tr ref={ref} className={`${className}`} {...props} />
  )
);
TableRow.displayName = "TableRow";

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  className?: string;
}
const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className = "", ...props }, ref) => (
    <th
      ref={ref}
      className={`min-w-[120px] px-4 py-4 font-medium text-dark dark:text-white ${className}`}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  className?: string;
}
const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className = "", ...props }, ref) => (
    <td
      ref={ref}
      className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${className}`}
      {...props}
    />
  )
);
TableCell.displayName = "TableCell";

export {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
};
