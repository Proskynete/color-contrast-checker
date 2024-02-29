const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-400 px-10">
      <div className="my-4 md:my-6">
        <div className="w-full flex flex-row justify-center md:justify-end">
          <pre className="text-xs font-thin">
            Color Contras Checker developed by{" "}
            <a
              href="https://eduardoalvarez.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white"
            >
              Eduardo Álvarez
            </a>
          </pre>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
