const HeadingTypography = ({text}) =>{
    return(
    <>
    <div className="text-center">
        <h1 className="mb-4 text-2xl font-extrabold text-gray-900 dark:text-white md:text-3xl lg:text-3xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-blue-600 from-sky-400">{text}</span></h1>
    </div>
    </>
)}

export default HeadingTypography