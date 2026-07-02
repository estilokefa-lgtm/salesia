export default function Header() {
  return (
    <header
      className="
        h-16
        bg-white
        border-b
        flex
        items-center
        justify-between
        px-6
      "
    >

      <h3
        className="
          text-lg
          font-semibold
          text-gray-900
        "
      >
        Dashboard
      </h3>


      <div
        className="
          flex
          items-center
          gap-5
        "
      >

        <input
          placeholder="Buscar..."
          className="
            w-64
            px-4
            py-2
            rounded-lg
            border
            text-sm
            outline-none
            focus:ring-2
          "
        />


        <div
          className="
            font-medium
            text-gray-700
          "
        >
          Daniel
        </div>


      </div>


    </header>
  );
}