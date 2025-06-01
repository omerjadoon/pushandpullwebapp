import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Customer {
  id: string;
  displayName: string;
  email: string;
  mobile: string;
  goal: string;
  freetrial?: boolean;
}

interface SearchFormProps {
  onSearch?: (searchTerm: string) => void;
  placeholder?: string;
  initialValue?: string;
  customers?: Customer[];
  onCustomerSelect?: (customer: Customer) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ 
  onSearch, 
  placeholder = "Search", 
  initialValue = "",
  customers = [],
  onCustomerSelect
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Filter customers based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCustomers([]);
      setIsDropdownOpen(false);
      return;
    }

    const filtered = customers.filter(customer =>
      customer.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.mobile.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.goal.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 8); // Limit to 8 results

    setFilteredCustomers(filtered);
    setIsDropdownOpen(filtered.length > 0);
    setSelectedIndex(-1);
  }, [searchTerm, customers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && filteredCustomers[selectedIndex]) {
      handleCustomerSelect(filteredCustomers[selectedIndex]);
    } else if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Call onSearch immediately for real-time search
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCustomers.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && filteredCustomers[selectedIndex]) {
          handleCustomerSelect(filteredCustomers[selectedIndex]);
        }
        break;
      case "Escape":
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSearchTerm(customer.displayName);
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    
    if (onCustomerSelect) {
      onCustomerSelect(customer);
    } else {
      // Navigate to customer detail page
      router.push(`/customers/${customer.id}`);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    if (onSearch) {
      onSearch("");
    }
    inputRef.current?.focus();
  };

  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 dark:bg-yellow-800 font-medium">
          {part}
        </span>
      ) : part
    );
  };

  return (
    <>
      <li className="hidden lg:block">
        <div ref={searchRef} className="relative">
          <form onSubmit={handleSubmit}>
            <div className="relative w-full max-w-[300px]">
              <button 
                type="submit"
                className="absolute left-5 top-1/2 -translate-y-1/2 text-dark hover:text-primary dark:text-dark-6 dark:hover:text-primary z-10"
              >
                <svg
                  className="fill-current"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_1791_1693)">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.625 2.0625C5.00063 2.0625 2.0625 5.00063 2.0625 8.625C2.0625 12.2494 5.00063 15.1875 8.625 15.1875C12.2494 15.1875 15.1875 12.2494 15.1875 8.625C15.1875 5.00063 12.2494 2.0625 8.625 2.0625ZM0.9375 8.625C0.9375 4.37931 4.37931 0.9375 8.625 0.9375C12.8707 0.9375 16.3125 4.37931 16.3125 8.625C16.3125 10.5454 15.6083 12.3013 14.4441 13.6487L16.8977 16.1023C17.1174 16.3219 17.1174 16.6781 16.8977 16.8977C16.6781 17.1174 16.3219 17.1174 16.1023 16.8977L13.6487 14.4441C12.3013 15.6083 10.5454 16.3125 8.625 16.3125C4.37931 16.3125 0.9375 12.8707 0.9375 8.625Z"
                      fill=""
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_1791_1693">
                      <rect width="18" height="18" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </button>
              <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (filteredCustomers.length > 0) {
                    setIsDropdownOpen(true);
                  }
                }}
                className="w-full rounded-full border border-stroke bg-gray-2 py-3 pl-13.5 pr-5 text-dark focus:border-primary focus:outline-none dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:focus:border-primary xl:w-[300px]"
                autoComplete="off"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark hover:text-primary dark:text-dark-6 dark:hover:text-primary text-xl z-10"
                >
                  ×
                </button>
              )}
            </div>
          </form>

          {/* Dropdown Results */}
          {isDropdownOpen && filteredCustomers.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-2 border border-stroke dark:border-dark-3 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="py-2">
                {filteredCustomers.map((customer, index) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => handleCustomerSelect(customer)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-dark-3 focus:bg-gray-50 dark:focus:bg-dark-3 focus:outline-none transition-colors ${
                      index === selectedIndex ? 'bg-gray-50 dark:bg-dark-3' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {customer.displayName.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-dark dark:text-white truncate">
                              {highlightMatch(customer.displayName, searchTerm)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {highlightMatch(customer.email, searchTerm)}
                            </p>
                          </div>
                        </div>
                        {customer.mobile && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 ml-11">
                            {highlightMatch(customer.mobile, searchTerm)}
                          </p>
                        )}
                        {customer.goal && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 ml-11">
                            Goal: {highlightMatch(customer.goal, searchTerm)}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        {customer.freetrial && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                            Free Trial
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                
                {/* Show more results indicator */}
                {customers.filter(customer =>
                  customer.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  customer.mobile.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  customer.goal.toLowerCase().includes(searchTerm.toLowerCase())
                ).length > 8 && (
                  <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-stroke dark:border-dark-3">
                    Showing first 8 results. Type more to refine your search.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No results message */}
          {isDropdownOpen && filteredCustomers.length === 0 && searchTerm && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-2 border border-stroke dark:border-dark-3 rounded-lg shadow-lg z-50">
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                No customers found matching "{searchTerm}"
              </div>
            </div>
          )}
        </div>
      </li>
    </>
  );
};

export default SearchForm;