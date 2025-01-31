const Spinner = ({ label = "Loading..." }: { label?: string }) => {
  return (
    <div className="absolute left-0 top-0 h-full w-full z-[99] rounded-xl overflow-hidden">
      <div className="h-full w-full relative z-10 flex items-center justify-center">
        <div>
          <p className="text-2xl tracking-wide text-center text-primary font-bold animate-bounce">
            {label}
          </p>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-black/10 backdrop-blur-md z-0" />
    </div>
  );
};

export default Spinner;
