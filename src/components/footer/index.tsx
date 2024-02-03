const Footer = () => {
  return (
    <footer className="text-center">
      <div className="mt-16 flex flex-col items-center">
        <div className="mt-5 flex flex-col items-center">
          <div className="mb-2 flex space-x-2 text-sm">
            <pre className="text-xs text-gray-800">
              &gt; $ cd ~/eduardoalvarez.dev/2024
              <span className="w-1 h-4 inline-block bg-primary-800 dark:bg-gray-400 ml-2 rounded-sm motion-safe:animate-ping motion-safe:duration-75" />
            </pre>
          </div>
          <div className="mb-8 text-sm">
            <a href="https://eduardoalvarez.dev">eduardoalvarez.dev</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
