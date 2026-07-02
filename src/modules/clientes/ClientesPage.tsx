import ClienteTable from "./components/ClienteTable";


export default function ClientesPage(){

return (

<div>


<div className="
flex
justify-between
items-center
">


<div>

<h1 className="
text-3xl
font-bold
">
Clientes
</h1>


<p className="
mt-2
text-gray-500
">
Gestión de clientes y leads
</p>

</div>


<button
className="
rounded-lg
bg-black
text-white
px-5
py-2
"
>
+ Nuevo cliente
</button>


</div>



<div className="mt-6">

<input
placeholder="Buscar cliente..."
className="
border
rounded-lg
px-4
py-2
w-80
"
/>


</div>



<ClienteTable />


</div>

)

}