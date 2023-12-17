import { useRef, useState, useCallback, useEffect } from "react";

import Places from "./components/Places.jsx";
import Modal from "./components/Modal.jsx";
import DeleteConfirmation from "./components/DeleteConfirmation.jsx";
import logoImg from "./assets/logo.png";
import AvailablePlaces from "./components/AvailablePlaces.jsx";
import { fetchUserPlaces, updateUserPlaces } from "./http.js";
import Error from "./components/Error.jsx";

function App() {
  const selectedPlace = useRef();

  const [userPlaces, setUserPlaces] = useState([]);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState();

  const [isFetching, setIsFetching] = useState(false);

  const [error, setError] = useState();

  useEffect(() => {
    // backend data
    async function fetchingUserPlaces() {
      try {
        setIsFetching(true);
        const places = await fetchUserPlaces();
        setUserPlaces(places);
      } catch (e) {
        setError({
          message: e.message || "An error occured, please try again..",
        });
      }

      setIsFetching(false);
    }

    fetchingUserPlaces();
  }, []);

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    // frontend update
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });

    // backend update
    try {
      const alreadyChosen = userPlaces.filter(
        (place) => place.id === selectedPlace.id
      );

      console.log("already chosen....", alreadyChosen.length);
      console.log("selected place....", selectedPlace);

      if (alreadyChosen.length > 0) {
      } else {
        await updateUserPlaces([selectedPlace, ...userPlaces]);
      }
    } catch (e) {
      setUserPlaces(userPlaces);
      setErrorUpdatingPlaces({
        message: e.message || "error selecting images..",
      });
    }
  }

  const handleRemovePlace = useCallback(
    // frontend update
    async function handleRemovePlace() {
      setUserPlaces((prevPickedPlaces) =>
        prevPickedPlaces.filter(
          (place) => place.id !== selectedPlace.current.id
        )
      );

      // backend update
      try {
        await updateUserPlaces(
          userPlaces.filter((place) => place.id !== selectedPlace.current.id)
        );
      } catch (e) {
        setUserPlaces(userPlaces);
        setErrorUpdatingPlaces({
          message: e.message || "error deleting image..",
        });
      }

      setModalIsOpen(false);
    },
    [userPlaces]
  );

  function errorHandle() {
    setErrorUpdatingPlaces(null);
  }

  return (
    <>
      <Modal open={errorUpdatingPlaces} onClose={errorHandle}>
        {errorUpdatingPlaces && (
          <Error
            onConfirm={errorHandle}
            title="An Error Occured"
            message={errorUpdatingPlaces.message}
          />
        )}
      </Modal>

      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && <Error title="An Error Occured.." message={error.message} />}
        {!error && (
          <Places
            isLoading={isFetching}
            loadingText="fetching user places.."
            title="I'd like to visit ..."
            fallbackText="Select the places you would like to visit below."
            places={userPlaces}
            onSelectPlace={handleStartRemovePlace}
          />
        )}

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
