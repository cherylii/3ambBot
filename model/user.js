const userDB = {
    addUser: (username, email, contact, password, type, profile_pic_url, callback) => {
        const conn = db.getConnection()
        conn.connect((err) => {
            if (err) { console.log(err); return callback(err, null) }
            console.log("Connected! - addUser")
            const sql = "INSERT INTO user(username,email,contact,password,type,profile_pic_url) VALUES(?,?,?,?,?,?)"
            conn.query(sql, [username, email, contact, password, type, profile_pic_url], (err, result) => {
                return err ? callback(err, null) : callback(null, result)
            })
        })
    },
    getUser: (userid, callback) => {
        const conn = db.getConnection()
        conn.connect((err) => {
            if (err) { console.log(err); return callback(err, null) }
            console.log("Connected! - getUser")
            const sql = 'SELECT userid,username,email,contact,type,profile_pic_url,created_at FROM user WHERE userid = ?'

            conn.query(sql, [userid], (err, result) => {
                return err ? callback(err, null) : callback(null, result)
            })
        })
    },
}