export default function jsonify<T>(obj: T): any {
  return JSON.parse(JSON.stringify(obj));
}
