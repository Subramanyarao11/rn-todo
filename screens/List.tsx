import { View, StyleSheet, TextInput, Button, SafeAreaView, TouchableOpacity, Text, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { FIRESTORE_DB } from '../Firebase';
import Ionicons from '@expo/vector-icons/Ionicons'
import { Entypo } from '@expo/vector-icons';


export interface Todo {
	done: boolean;
	id: string;
	title: string;
}

const List = () => {
	const [todos, setTodos] = useState<any[]>([]);
	const [todo, setTodo] = useState('');

	useEffect(() => {
		const todoRef = collection(FIRESTORE_DB, 'todos');

		const subscriber = onSnapshot(todoRef, {
			next: (snapshot) => {
				const todos: any[] = [];
				snapshot.docs.forEach((doc) => {
					todos.push({
						id: doc.id,
						...doc.data()
					});
				});

				setTodos(todos);
			}
		});
		return () => subscriber();
	}, []);

	const addTodo = async () => {
		// TODO
		try {
			const docRef = await addDoc(collection(FIRESTORE_DB, 'todos'), {
				title: todo,
				done: false
			});
			setTodo('');
			console.log('Document written with ID: ', docRef.id);
		} catch (e) {
			console.error('Error adding document: ', e);
		}
	};

	const renderTodo = ({ item }: any) => {
		const ref = doc(FIRESTORE_DB, `todos/${item.id}`);

		const toggleDone = async () => {
			updateDoc(ref, { done: !item.done });
		};

		const deleteItem = async () => {
			deleteDoc(ref);
		};

		return (
			<View style={styles.todoContainer}>
				<TouchableOpacity onPress={toggleDone} style={styles.todo}>
					{item.done && <Ionicons name="checkmark-circle" size={32} color="green" />}
					{!item.done && <Entypo name="circle" size={32} color="black" />}
					<Text style={styles.todoText}>{String(item.title)}</Text>
				</TouchableOpacity>
				<Ionicons name="trash-bin-outline" size={24} color="red" onPress={deleteItem} />
			</View>
		);
	};


	return (
		<View style={styles.container}>
			<View style={styles.form}>
				<TextInput
					style={styles.input}
					placeholder="Add new todo"
					onChangeText={(text: string) => setTodo(text)}
					value={todo}
				/>
				<Button onPress={addTodo} title="Add Todo" disabled={todo === ''} />
			</View>
			{todos.length > 0 && (
			<View>
				<FlatList
					data={todos}
					renderItem={renderTodo}
					keyExtractor={(todo) => todo.id}
				/>
			</View>
		)}
		</View>
	);
};



const styles = StyleSheet.create({
	container: {
		marginHorizontal: 20
	},
	form: {
		marginVertical: 20,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	input: {
		flex: 1,
		height: 40,
		borderWidth: 1,
		borderRadius: 4,
		padding: 10,
		backgroundColor: '#fff'
	},
	todo: {
		flexDirection: 'row',
		flex: 1,
		alignItems: 'center'
	},
	todoText: {
		flex: 1,
		paddingHorizontal: 4
	},
	todoContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		padding: 10,
		marginVertical: 4
	}
});

export default List;
