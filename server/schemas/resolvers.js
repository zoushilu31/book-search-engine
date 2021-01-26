const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
	// me query
	Query: {
		me: async (parent, args, context) => {
			if (context.user) {
				const userData = await User.findOne({
					_id: context.user._id,
				}).select('-__v -password');

				return userData;
			}

			throw new AuthenticationError('Not logged in');
		},
	},

	// mutations for functions
	Mutation: {
		// adding a new user
		addUser: async (parent, args) => {
			const user = await User.create(args);
			const token = signToken(user);

			return { token, user };
		},
		// login
		login: async (parent, { email, password }) => {
			const user = await User.findOne({ email });

			if (!user) {
				throw new AuthenticationError(
					'Incorrect credentials'
				);
			}

			const correctPw = await user.isCorrectPassword(
				password
			);

			if (!correctPw) {
				throw new AuthenticationError(
					'Incorrect credentials'
				);
			}

			const token = signToken(user);
			return { token, user };
		},
		// saving a book
		saveBook: async (parent, bookData, context) => {
			if (context.user) {
				const updatedUser = await User.findOneAndUpdate(
					{ _id: context.user._id },
					{ $push: { savedBooks: bookData } },
					{ new: true, runValidators: true }
				);
				console.log(updatedUser);
				return updatedUser;
			}
		},
		// deleting a book
		removeBook: async (parent, { bookId }, context) => {
			if (context.user) {
				const deleteBook = await User.findOneAndUpdate(
					{ _id: context.user._id },
					{ $pull: { savedBooks: { bookId } } },
					{ new: true, runValidators: true }
				);

				delete deleteBook;

				return deleteBook;
			}
		},
	},
};

module.exports = resolvers;
