import { FilmGrid } from "../components/FilmComponents/FilmGrid";
import { FilmSlider } from "../components/FilmSliders/FilmSlider";
import { FilmSliderComedy } from "../components/FilmSliders/FilmSliderComedy";
import { FilmSliderDrama } from "../components/FilmSliders/FilmSliderDrama";
import { FilmSliderFolklore } from "../components/FilmSliders/FilmSliderFolklore";
import { FilmSliderHorror } from "../components/FilmSliders/FilmSliderHorror";
import { FilmSliderReco } from "../components/FilmSliders/FilmSliderReco";
import FilmVideo from "../components/FilmComponents/FilmVideo";
import RecentlyAdded from "../components/RecentlyAdded";
import { auth } from "@clerk/nextjs/server";

export default async function HomePage() {
    const { userId } = await auth();

    if (!userId) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
                <div className="text-center p-8 border border-red-600 rounded-lg shadow-lg">
                    <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
                    <p className="text-xl mb-6">You must be logged in to view this page.</p>
                    <a
                        href="/sign-in"
                        className="inline-block px-6 py-3 text-lg font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
                    >
                        Login Now
                    </a>
                </div>
            </div>
        );
    }
    

    return (
        <div className="pt-[4rem] lg:pt-[5rem] p-5 lg:p-0">
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
        </div>
    );
    
}
