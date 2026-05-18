import { data } from "react-router-dom";
import { success } from "zod";

const Response = {
    success(res, data, message = 'Success', statusCode = 200){
        return res.status(statusCode).json({
            success: true,
            message,
            data
        })
    },

    created(res, data, message = 'Created successfully'){
        return Response.success(res, data, message, 201)
    },

    noContent(res){
        return res.status(204).send()
    },

    paginated(res, {users, total, page, limit, totalPages}){
        return res.status(200).json({
            success: true,
            data: users,
            meta: {total, page, limit, totalPages}
        })
    },

    error(rs, message ='Erro', statusCode = 400){
        return res.status(statusCode).json({
            success: false,
            message
        })
    }
}

export default Response
