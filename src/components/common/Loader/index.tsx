import Image from "next/image";

const Loader = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-dark dark:bg-dark">
      {/* <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div> */}
      <Image
        src="/images/preloader.gif"
        alt="loader"
        width={100}
        height={100}
     
      />

      
    
    </div>
  );
};

export default Loader;
