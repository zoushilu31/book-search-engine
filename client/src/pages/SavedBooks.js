import React, { useState, useEffect } from 'react';
import {
	Jumbotron,
	Container,
	CardColumns,
	Card,
	Button,
} from 'react-bootstrap';

import { getMe, deleteBook } from '../utils/API';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

import { useMutation } from '@apollo/react-hooks';
import { useQuery } from '@apollo/client';
import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';

const SavedBooks = () => {
	// const [userData, setUserData] = useState({});

	// use this to determine if `useEffect()` hook needs to run again
	const userData = useQuery(GET_ME);
	const [removeBook, { error }] = useMutation(REMOVE_BOOK);

	// localStorage.setItem(
	// 	'saved_books',
	// 	userData.data ? userData.data.me.savedBooks : []
	// );

	const userDataLength = Object.keys(userData).length;

	// create function that accepts the book's mongo _id value as param and deletes the book from the database
	const handleDeleteBook = async (bookId) => {
		const token = Auth.loggedIn() ? Auth.getToken() : null;

		if (!token) {
			return false;
		}

		try {
			const { data } = await removeBook({
				variables: {
					bookId: bookId,
				},
			});

			// upon success, remove book's id from localStorage
			removeBookId(bookId);
			console.log(data);
		} catch (err) {
			console.error(err);
		}
	};

	// if data isn't here yet, say so
	if (!userDataLength) {
		return <h2>LOADING...</h2>;
	}

	return (
		<>
			<Jumbotron fluid className='text-light bg-dark'>
				<Container>
					<h1>Viewing saved books!</h1>
				</Container>
			</Jumbotron>
			<Container>
				<h2>
					{userData.data &&
					userData.data.me.savedBooks?.length
						? `Viewing ${
								userData.data.me
									.savedBooks
									.length
						  } saved ${
								userData.data.me
									.savedBooks
									.length ===
								1
									? 'book'
									: 'books'
						  }:`
						: 'You have no saved books!'}
				</h2>
				<CardColumns>
					{userData.data &&
						userData.data.me.savedBooks.map(
							(book) => {
								return (
									<Card
										key={
											book.bookId
										}
										border='dark'>
										{book.image ? (
											<Card.Img
												src={
													book.image
												}
												alt={`The cover for ${book.title}`}
												variant='top'
											/>
										) : null}
										<Card.Body>
											<Card.Title>
												{
													book.title
												}
											</Card.Title>
											<p className='small'>
												Authors:{' '}
												{
													book.authors
												}
											</p>
											<Card.Text>
												{
													book.description
												}
											</Card.Text>
											<Button
												className='btn-block btn-danger'
												onClick={() =>
													handleDeleteBook(
														book.bookId
													)
												}>
												Delete
												this
												Book!
											</Button>
										</Card.Body>
									</Card>
								);
							}
						)}
				</CardColumns>
			</Container>
		</>
	);
};

export default SavedBooks;