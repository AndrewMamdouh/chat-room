import Link from "next/link";

const HomePage = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <Link
        href="/login"
        className="max-w-64 flex w-full justify-center items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Let{"'"}s Start
      </Link>
    </div>
  );
};

export default HomePage;
