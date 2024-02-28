const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white px-10">
      <div className="my-4 md:my-8 flex flex-col">
        <div className="w-full flex flex-row justify-center md:justify-end">
          <div className=" flex space-x-2 text-sm">
            <pre className="text-xs">
              $ cd ~/
              <a href="https://eduardoalvarez.dev/">eduardoalvarez.dev</a>/2024
              <span className="w-1 h-4 inline-block bg-primary-800 dark:bg-gray-400 ml-1 rounded-sm motion-safe:animate-ping motion-safe:duration-75" />
            </pre>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
