import { useEffect, useState } from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite';

const API_BASE_URL= "https://api.themoviedb.org/3"
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method:'GET',
    headers:{
        accept:'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}

const App = () => {
    const[searchTerm,setSearchTerm]= useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const[movieList,setMovieList] = useState([]);
    const[isloading,setIsLoading] = useState(false);
    const[debouncedSearchTerm,setDebouncedSearchTerm] = useState('');
    const[trendingMovie,setTrendingMovies] = useState([]);
    useDebounce(()=>setDebouncedSearchTerm(searchTerm),2000,[searchTerm]);

    const fetchMovie = async (query ='')=>{
        setIsLoading(true);
        setErrorMessage('');
        try {
            const endpoint = query
            ?`${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
            :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint,API_OPTIONS);
            if (!response.ok) {
                throw new Error("Failed to fetch the movie ")
            }

            const data = await response.json();
            console.log(data)
            if(data.Response =='False'){
                setErrorMessage(data.Error || 'Failed to fetch movie')
                setMovieList([]);
                return;
            }

            setMovieList(data.results)
            if(query && data.results.length>0){
                await updateSearchCount(query,data.results[0])
            }
        } catch (error) {
            console.error(`Error fetching error ${error}`);
            setErrorMessage("Error Fetching Movies , Please try again later.")
        }
        finally{
            setIsLoading(false);
        }
    }

    const loadTrendingMovie = async()=>{
        try {
            const movies = await getTrendingMovies();

            setTrendingMovies(movies);
        } catch (error) {
            console.error(error);

        }
    }
    useEffect(()=>{
        fetchMovie(debouncedSearchTerm);
    },[debouncedSearchTerm])

    useEffect(()=>{
        loadTrendingMovie();
    },[])

  return (
    <main>
        <div className="pattern"></div>

        <div className="wrapper">
            <header>
                <img src="./hero.png" alt="" />
                <h1>
                    Find <span className='text-gradient'>Movies</span> You'll Love Without the Hassle
                </h1>
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
            </header>
            {trendingMovie.length > 0 && (
                <section className="trending">
                    <h2>Trending Movies</h2>
                    <ul>
                        {trendingMovie.map((movie, index) => (
                            <li key={movie.$id}>
                                <p>{index + 1}</p>
                                <img src={movie.poster_url} alt={movie.title} />
                            </li>
                        ))}
                    </ul>
                </section>
            )}
            <section className="all-movies">
                <h2 className='mt-[40px]'>All Movies</h2>

            {
            isloading ? (<Spinner />) :
            errorMessage ? (
                <p className="error-message">{errorMessage}</p>) :
                (
                <ul>
                    {movieList.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                    ))}
                </ul>
            )}
            </section>
        </div>

    </main>
  )
}

export default App
