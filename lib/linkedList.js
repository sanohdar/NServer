class Node {
    constructor(element) {
        this.element = element;
        this.next = null;
    }
}

class LiskedList{

    constructor(){
        this.head = null;
        this.size = 0;
    }

    add(element){

        var node = new Node(element);
        var curr;
        if(this.head == null)
            this.head = node;
        else{
            curr = this.head;
            while(curr.next){
                curr=curr.next;
            }
            curr.next = node;
        }
        this.size++;
    }

    insertAt(element,index){
        if(index >0 && index < this.size)
            return
        else{
            var node = new Node(element);
            var curr = this.head;
            for(let i=0;i<index;i++){
                curr = curr.next;
            }
            var next = curr.next;

            curr.next = node;
            node.next = next;
        }
    }
    getSize(){
        console.log('Size of LinkedList',this.size)
    }
    printList(){
        var curr = this.head;
        var str = ''
        while(curr){
            str += curr.element + ' ';
            curr = curr.next
        }
        console.log(str)
    }
}


var ll = new LiskedList();

ll.add(23)
ll.add(24)
ll.add(25)
ll.add(26)
ll.add(27)
ll.add(28)
ll.add(29)
ll.add(3)
ll.insertAt(234,3)
ll.insertAt(232,2)
ll.insertAt(235,5)

ll.printList()