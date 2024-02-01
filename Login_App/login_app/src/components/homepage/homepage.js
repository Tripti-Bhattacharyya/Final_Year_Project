
import "./homepage.css"

const Homepage = ({setLoginUser}) => {
    return (
        <div className="homepage">
         <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tenetur earum adipisci eaque modi sed! Facilis porro natus labore ipsam inventore impedit nesciunt id, quia, culpa totam cupiditate molestias aut rem, quam excepturi tempore. Ut soluta repellendus suscipit saepe magnam est expedita in porro assumenda? Ea facere minus aut incidunt ipsam doloremque in molestiae voluptas earum possimus. Cupiditate nisi laborum laboriosam quaerat aliquid consequatur! Veniam, eos repudiandae. At aperiam eum corrupti quisquam possimus similique aspernatur magnam, laudantium impedit rerum! Accusamus veniam reiciendis temporibus hic ea. Quam ut molestiae quibusdam unde alias.</p>
            <div className="button" onClick={() => setLoginUser({})} >Logout</div>
        </div>
    )
}

export default Homepage