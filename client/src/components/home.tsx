const Home = () => {
  return (
    <div>
      Home page
      <a
        className="bg-white p-1 rounded-lg outline-double -outline-offset-2 border-b-8 border-yellow-400 w-32 shadow-lg shadow-yellow-200 hover:mt-1 active:border-b-0 active:mt-4 hover:bg-slate-200 active:shadow"
        href="/game"
      >
        Play Game
      </a>
    </div>
  );
};

export default Home;
