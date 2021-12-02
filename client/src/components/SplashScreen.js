import { Grid, Button } from '@mui/material';
import { Link } from 'react-router-dom'

export default function SplashScreen() {
    return (
        <div id="splash-screen">
            <div id="splash-text"><strong>The Top 5 Lister</strong></div>
            <div id="splash-subtext">
                Put your top 5 to the test!<br />
                From video games to Pink Floyd songs,<br />
                this site makes it easy and intuitive to<br />
                show your favorites to the world and<br />
                see how your friends compare.
            </div>
            <Grid container justifyContent="center" alignItems="center" spacing={4}>
                <Grid item><Link to='/login/' style={{ textDecoration: 'none' }}><Button variant="contained">LOGIN</Button></Link></Grid>
                <Grid item><Link to='/register/' style={{ textDecoration: 'none' }}><Button variant="contained">SIGN UP</Button></Link></Grid>
                <Grid item><Button variant="contained">GUEST</Button></Grid>
            </Grid>
        </div>
    )
}