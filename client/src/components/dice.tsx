interface PROPS {
  piece: string;
}

const Dice = (props: PROPS) => {
  const handleDiceRoll = () => {
    const cube = document.getElementById("cube");

    if (cube) {
      cube.classList.add("roll");
      setTimeout(() => {
        cube.classList.remove("roll");
      }, 1000);
    }
  };

  return (
    <div>
      <div className="w-full flex justify-center">
        <button onClick={handleDiceRoll}>
          <section className="container text-wrap ">
            <div id="cube">
              <div className="front face">
                <div className="text-xs">{props.piece}</div>
              </div>
              <div className="back face">
                <div className="text-xs">K</div>
              </div>
              <div className="right face">
                <div className="">Q</div>
              </div>
              <div className="left face">
                <div className="">B</div>
              </div>
              <div className="top face">
                <div className="">R</div>
              </div>
              <div className="bottom face">
                <div className="">K</div>
              </div>
            </div>
          </section>
        </button>
      </div>
    </div>
  );
};

export default Dice;
