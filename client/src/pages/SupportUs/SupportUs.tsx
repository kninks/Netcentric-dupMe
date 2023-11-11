import React from 'react'
import { Link } from 'react-router-dom'

function SupportUs() {
    return (
        <div>
            <h1>Thank you for supporting us</h1>
            <img src='/support_us/knQR.jpg' />
            <h2>Boombayah</h2>
            <p>6438014821 Kankanit Suppataratarn</p>
            <p>6438016021 Kantapong Horaraung</p>
            <p>6438059021 Napacha Mahadumrongkul</p>
            <p>6438123521 Nalanlak Wonggulya</p>
            <p>6438208221 Weeraya Hew</p>
            <Link to="/">
                <button>Back to Home</button>
            </Link>
        </div>
    )
}

export default SupportUs