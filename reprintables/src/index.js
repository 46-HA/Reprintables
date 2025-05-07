import { useState, useRef } from 'react';

export default function CardDesigner() {
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  // Add a new text element
  const addText = () => {
    const newElement = {
      id: Date.now(),
      type: 'text',
      content: 'Double click to edit',
      x: 100,
      y: 100,
      fontSize: 16,
      color: '#000000',
      editable: false
    };
    setElements([...elements, newElement]);
  };

  // Add a shape element
  const addShape = (shapeType) => {
    const newElement = {
      id: Date.now(),
      type: 'shape',
      shapeType: shapeType,
      x: 100,
      y: 100,
      width: 100,
      height: shapeType === 'circle' ? 100 : 50,
      color: '#3b82f6'
    };
    setElements([...elements, newElement]);
  };

  // Handle element selection
  const handleElementClick = (e, element) => {
    e.stopPropagation();
    setSelectedElement(element);
  };

  // Handle canvas click to deselect
  const handleCanvasClick = () => {
    setSelectedElement(null);
  };

  // Handle text editing
  const handleDoubleClick = (element) => {
    if (element.type === 'text') {
      const updatedElements = elements.map(el => 
        el.id === element.id ? { ...el, editable: true } : el
      );
      setElements(updatedElements);
    }
  };

  // Handle text change
  const handleTextChange = (e, id) => {
    const updatedElements = elements.map(el => 
      el.id === id ? { ...el, content: e.target.value } : el
    );
    setElements(updatedElements);
  };

  // Handle text blur to end editing
  const handleTextBlur = (id) => {
    const updatedElements = elements.map(el => 
      el.id === id ? { ...el, editable: false } : el
    );
    setElements(updatedElements);
  };

  // Handle mouse down for drag start
  const handleMouseDown = (e, element) => {
    e.stopPropagation();
    setSelectedElement(element);
    setIsDragging(true);
    setStartPos({
      x: e.clientX - element.x,
      y: e.clientY - element.y
    });
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e) => {
    if (!isDragging || !selectedElement) return;
    
    const newX = e.clientX - startPos.x;
    const newY = e.clientY - startPos.y;
    
    const updatedElements = elements.map(el => 
      el.id === selectedElement.id ? { ...el, x: newX, y: newY } : el
    );
    
    setElements(updatedElements);
    // Update the selected element as well
    setSelectedElement({...selectedElement, x: newX, y: newY});
  };

  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Delete the selected element
  const deleteElement = () => {
    if (!selectedElement) return;
    const filteredElements = elements.filter(el => el.id !== selectedElement.id);
    setElements(filteredElements);
    setSelectedElement(null);
  };

  // Update color of selected element
  const updateElementColor = (color) => {
    if (!selectedElement) return;
    
    const updatedElements = elements.map(el => 
      el.id === selectedElement.id ? { ...el, color: color } : el
    );
    
    setElements(updatedElements);
    setSelectedElement({...selectedElement, color: color});
  };

  // Update font size of selected text element
  const updateFontSize = (size) => {
    if (!selectedElement || selectedElement.type !== 'text') return;
    
    const updatedElements = elements.map(el => 
      el.id === selectedElement.id ? { ...el, fontSize: size } : el
    );
    
    setElements(updatedElements);
    setSelectedElement({...selectedElement, fontSize: size});
  };

  // Export card as an image
  const exportCard = () => {
    if (!canvasRef.current) return;
    
    // Create a notification that this is just a demo
    alert('In a real app, this would download your card as an image. This is just a demo.');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">Simple Card Designer</h1>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Toolbox */}
        <div className="w-64 bg-white p-4 shadow-md flex flex-col space-y-4">
          <h2 className="font-semibold text-lg">Tools</h2>
          
          {/* Add elements buttons */}
          <div className="space-y-2">
            <button 
              onClick={addText}
              className="flex items-center space-x-2 w-full bg-gray-100 hover:bg-gray-200 p-2 rounded"
            >
              <span className="font-bold">T</span>
              <span>Add Text</span>
            </button>
            
            <button 
              onClick={() => addShape('rectangle')}
              className="flex items-center space-x-2 w-full bg-gray-100 hover:bg-gray-200 p-2 rounded"
            >
              <span className="w-4 h-4 bg-blue-600"></span>
              <span>Add Rectangle</span>
            </button>
            
            <button 
              onClick={() => addShape('circle')}
              className="flex items-center space-x-2 w-full bg-gray-100 hover:bg-gray-200 p-2 rounded"
            >
              <span className="w-4 h-4 bg-blue-600 rounded-full"></span>
              <span>Add Circle</span>
            </button>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h2 className="font-semibold text-lg mb-2">Card Background</h2>
            <div className="flex items-center space-x-2">
              <label className="text-sm">Color:</label>
              <input 
                type="color" 
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-8 h-8 border border-gray-300 rounded"
              />
            </div>
          </div>
          
          {/* Element properties when selected */}
          {selectedElement && (
            <div className="border-t border-gray-200 pt-4">
              <h2 className="font-semibold text-lg mb-2">Element Properties</h2>
              
              <div className="space-y-2">
                {selectedElement.type === 'text' && (
                  <div className="flex items-center space-x-2">
                    <label className="text-sm">Font size:</label>
                    <input 
                      type="number" 
                      min="8"
                      max="72"
                      value={selectedElement.fontSize}
                      onChange={(e) => updateFontSize(parseInt(e.target.value))}
                      className="w-16 border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <label className="text-sm">Color:</label>
                  <input 
                    type="color" 
                    value={selectedElement.color}
                    onChange={(e) => updateElementColor(e.target.value)}
                    className="w-8 h-8 border border-gray-300 rounded"
                  />
                </div>
                
                <button 
                  onClick={deleteElement}
                  className="flex items-center space-x-2 w-full bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded"
                >
                  <span className="text-red-600">✕</span>
                  <span>Delete Element</span>
                </button>
              </div>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-4 mt-auto">
            <button 
              onClick={exportCard}
              className="flex items-center justify-center space-x-2 w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
            >
              <span>⬇️</span>
              <span>Export Card</span>
            </button>
          </div>
        </div>
        
        {/* Canvas area */}
        <div 
          className="flex-1 flex items-center justify-center p-8 overflow-auto"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div 
            ref={canvasRef}
            style={{ backgroundColor }}
            className="w-96 h-64 shadow-lg rounded-md relative cursor-default"
            onClick={handleCanvasClick}
          >
            {elements.map(element => (
              <div 
                key={element.id}
                style={{ 
                  position: 'absolute',
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  cursor: 'move',
                  border: selectedElement?.id === element.id ? '2px dashed #3b82f6' : 'none',
                  padding: selectedElement?.id === element.id ? '2px' : '0',
                  margin: selectedElement?.id === element.id ? '-4px' : '0'
                }}
                onClick={(e) => handleElementClick(e, element)}
                onMouseDown={(e) => handleMouseDown(e, element)}
                onDoubleClick={() => handleDoubleClick(element)}
              >
                {element.type === 'text' && !element.editable ? (
                  <div 
                    style={{ 
                      color: element.color,
                      fontSize: `${element.fontSize}px`
                    }}
                  >
                    {element.content}
                  </div>
                ) : element.type === 'text' && element.editable ? (
                  <input
                    type="text"
                    value={element.content}
                    onChange={(e) => handleTextChange(e, element.id)}
                    onBlur={() => handleTextBlur(element.id)}
                    autoFocus
                    style={{ 
                      color: element.color,
                      fontSize: `${element.fontSize}px`,
                      background: 'transparent',
                      border: '1px solid #3b82f6'
                    }}
                  />
                ) : element.type === 'shape' && element.shapeType === 'rectangle' ? (
                  <div 
                    style={{ 
                      width: `${element.width}px`, 
                      height: `${element.height}px`,
                      backgroundColor: element.color
                    }}
                  />
                ) : element.type === 'shape' && element.shapeType === 'circle' ? (
                  <div 
                    style={{ 
                      width: `${element.width}px`, 
                      height: `${element.height}px`,
                      backgroundColor: element.color,
                      borderRadius: '50%'
                    }}
                  />
                ) : null}
                
                {selectedElement?.id === element.id && (
                  <div 
                    className="absolute -top-6 left-0 bg-blue-600 text-white text-xs px-1 rounded"
                  >
                    <span>⇄</span> Drag to move
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}