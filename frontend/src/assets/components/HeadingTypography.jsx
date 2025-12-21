import { motion } from 'framer-motion';

const HeadingTypography = ({text}) =>{
    return(
        <div className="text-center">
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-tight"
            >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-red-700 hover:from-red-700 hover:via-red-600 hover:to-red-800 transition-all duration-500">
                    {text}
                </span>
            </motion.h1>
            {/* Decorative underline */}
            <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: "4rem" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full mx-auto mb-2"
            ></motion.div>
        </div>
    )
}

export default HeadingTypography