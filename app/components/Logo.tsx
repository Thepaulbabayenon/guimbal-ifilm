import logo from "../../public/logo.svg";
import Image from "next/image";
import Link from "next/link";

export const Logo = () => {
    return (
        <Link href="/home">
        <Image src={logo} alt="GuimbalIfilm Logo" width={90} height={50} className="fixed top-5 left-5"/>
        </Link>
    );
}