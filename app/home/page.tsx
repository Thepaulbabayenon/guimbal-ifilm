import { FilmGrid } from "../components/FilmGrid";
import { FilmSlider } from "../components/FilmSlider";
import { FilmSliderComedy } from "../components/FilmSliderComedy";
import { FilmSliderDrama } from "../components/FilmSliderDrama";
import { FilmSliderFolklore } from "../components/FilmSliderFolklore";
import { FilmSliderHorror } from "../components/FilmSliderHorror";
import { FilmSliderReco } from "../components/FilmSliderReco";
import FilmVideo from "../components/FilmVideo";
import RecentlyAdded from "../components/RecentlyAdded";
import { auth, currentUser } from "@clerk/nextjs/server";


export default async function HomePage() {
    // Assume we have the userId from somewhere (like session, context, or hardcoded for now)
    const { userId } = await auth()
    
    if (!userId) {
        throw new Error("User not logged in");
    }

    return (
        <div className="p-5 lg:p-0">
            <FilmVideo />
            <h1 className="text-3xl font-bold text-gray-400">BEST FILMS</h1>
            <RecentlyAdded />
            <h1 className="text-3xl font-bold text-gray-400">POPULAR FILMS</h1>
            <FilmSlider />

            <h1 className="text-3xl font-bold text-gray-400">COMEDY FILMS</h1>
            <FilmSliderComedy />

            <h1 className="text-3xl font-bold text-gray-400">DRAMA FILMS</h1>
            <FilmSliderDrama />

            <h1 className="text-3xl font-bold text-gray-400">FOLKLORE FILMS</h1>
            <FilmSliderFolklore />

            <h1 className="text-3xl font-bold text-gray-400">HORROR FILMS</h1>
            <FilmSliderHorror />
            
            <h1 className="text-3xl font-bold text-gray-400">RECOMMENDED FOR YOU</h1>
            <FilmSliderReco userId={userId.toString()} />
            <h1 className="text-3xl font-bold text-gray-400">SOME OF THE BEST</h1>
            <FilmGrid/>
        </div>
    );
}
