const asyncHandler =(requestHandler)=>{
   return (res,req,next)=>{
        Promise.resolve(requestHandler(res,req,next)).catch
        ((err)=> next(err))
    }

}
// higher order functions 
// those funcations can accept the paratmeter and arguments
//  node js error handling (class)



export {asyncHandler}

// try catch method
// const asyncHandler = (fn)=> async(req,res,next)=>{
//     try{
//         await fn(req,res,next)

//     }catch(error){
//         res.status(error.code || 500).json({
//             success:false,
//             message:error.message
//         })
//     }
// }