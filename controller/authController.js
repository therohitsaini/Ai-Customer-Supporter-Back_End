export const verifyToken = (req, res) => {
    return res.json({
        valid: true,
        user: req.user, 
    });
};

