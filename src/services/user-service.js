const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = require('../helpers/db');

const Users = db.Users;

async function login({ email, password }) {
    const user = await Users.findOne({ email });
    if (user && bcrypt.compareSync(password, user.hash)) {
        let jwtSecretKey = process.env.JWT_SECRET_KEY;
        let data = {
            time: Date(),
            userId: email,
        }
        const token = jwt.sign(data, jwtSecretKey);
        return {
            ...user.toJSON(),
            token
        };
    }
    else {
        return 'Authentitcation Failed';
    }
}
async function logout(req, res) {
    try {
        res.clearCookie('token', {
            httpOnly: true,  // Ensures the cookie is not accessible via JavaScript
            secure: process.env.NODE_ENV === 'production',  // Set to true in production to only allow HTTPS requests
            sameSite: 'strict', // Prevents the cookie from being sent with cross-origin requests
            path: '/' // Ensures the correct path is used
        });
        return { message: 'Logout successful' };
    } catch (err) {
        return {
            status: 'error',
            message: 'Internal Server Error',
        };
    }
}

async function getAll() {
    return await Users.find();
}

async function getById(id) {
    return await Users.findById(id);
}
async function create(userParam) {
    const existingUser = await Users.findOne({ email: userParam.email });
    if (existingUser === null) {
        const user = new User(userParam);
        if (userParam.password) {
            user.hash = bcrypt.hashSync(userParam.password, 10);
        }
        await user.save();
    }
    else {
        return { success: false, message: `${userParam.email} already exists , Please try with different email id .`}
    }
}

async function update(id, userParam) {
    const user = await Users.findById(id);
    // validate
    if (!user) throw 'User not found';
    if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }
    // hash password if it was entered
    if (userParam.password) {
        userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }
    // copy userParam properties to user
    Object.assign(user, userParam);
    await user.save();
}

async function _delete(id) {
    await Users.findByIdAndRemove(id);
}



module.exports = {
    login,
    logout,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};
