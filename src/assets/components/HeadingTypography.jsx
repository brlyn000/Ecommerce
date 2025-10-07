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
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 hover:from-purple-600 hover:via-blue-600 hover:to-indigo-500 transition-all duration-500">
                    {text}
                </span>
            </motion.h1>
            {/* Decorative underline */}
            <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: "4rem" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-2"
            ></motion.div>
        </div>
    )
}

export default HeadingTypography