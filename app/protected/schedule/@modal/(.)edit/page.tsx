import { Modal } from '@/components/modal';
export default function EditModal() {
    return (
        <Modal>
            <h2 className="text-lg font-bold">Give Feedback</h2>
            <form className="mt-4 flex flex-col gap-4">
                <textarea
                    placeholder="Your feedback..."
                    className="border rounded-lg p-2"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg"
                >
                    Submit
                </button>
            </form>
        </Modal>
    );
}  