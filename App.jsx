import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  //  This Code Will Fetch tasks realtime from 'tasks' collection
  useEffect(() => {
    const ref = firestore().collection('tasks');
    const unsubscribe = ref.orderBy('createdAt', 'desc').onSnapshot(snapshot => {
      if (!snapshot || snapshot.empty) {
        setTasks([]);
        setLoading(false);
        return;
      }
      const arr = [];
      snapshot.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
      setTasks(arr);
      setLoading(false);
    }, error => {
      console.error('Firestore onSnapshot error:', error);
      setTasks([]);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // This Will  Add new task
  const addTask = async () => {
    if (!task.trim()) return;
    const ref = firestore().collection('tasks');
    await ref.add({
      title: task,
      completed: false,
      createdAt: new Date(),
    });
    setTask('');
  };

  // This Will add  Toggle complete status
  const toggleCompleted = async (id, completed) => {
    const ref = firestore().collection('tasks').doc(id);
    await ref.update({ completed: !completed });
  };

  //  This Will Delete task
  const deleteTask = async (id) => {
    const ref = firestore().collection('tasks').doc(id);
    await ref.delete();
  };

  if (loading) return <SafeAreaView><Text>Loading tasks...</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My-To-Do</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={task}
          onChangeText={setTask}
          placeholder="Add a new task"
          style={styles.input}
        />
        <Button title="Add Task" onPress={addTask} />
      </View>
      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <TouchableOpacity onPress={() => toggleCompleted(item.id, item.completed)}>
              <Text style={[
                styles.taskText,
                item.completed && styles.completed
              ]}>{item.title}</Text>
            </TouchableOpacity>
            <Button title="🗑" onPress={() => deleteTask(item.id)} color="red" />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 40
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center'
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    padding: 10,
    marginRight: 8
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  taskText: {
    fontSize: 18
  },
  completed: {
    textDecorationLine: 'line-through',
    color: 'gray'
  }
});
