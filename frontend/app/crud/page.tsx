'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Item {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  description: string;
  priority: 'low' | 'medium' | 'high';
  notified: boolean;
  createdAt: Date;
}

const INITIAL_ITEMS: Item[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active',
    description: 'Senior Developer',
    priority: 'high',
    notified: true,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'active',
    description: 'Product Manager',
    priority: 'high',
    notified: true,
    createdAt: new Date('2024-02-20'),
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    status: 'pending',
    description: 'UI Designer',
    priority: 'medium',
    notified: false,
    createdAt: new Date('2024-03-10'),
  },
];

export default function CRUDPage() {
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    status: 'active' as 'active' | 'inactive' | 'pending',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    notified: false,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      status: 'active',
      description: '',
      priority: 'medium',
      notified: false,
    });
    setSelectedDate(undefined);
    setEditingId(null);
  };

  const handleOpen = (item?: Item) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name,
        email: item.email,
        status: item.status as 'active' | 'inactive' | 'pending',
        description: item.description,
        priority: item.priority as 'low' | 'medium' | 'high',
        notified: item.notified,
      });
      setSelectedDate(item.createdAt);
    } else {
      resetForm();
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingId !== null) {
      setItems(
        items.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...formData,
                createdAt: selectedDate || item.createdAt,
              }
            : item
        )
      );
      toast.success('Item updated successfully!');
    } else {
      const newItem: Item = {
        id: Math.max(...items.map((i) => i.id), 0) + 1,
        ...formData,
        createdAt: selectedDate || new Date(),
      };
      setItems([...items, newItem]);
      toast.success('Item created successfully!');
    }

    handleClose();
  };

  const handleDelete = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
    toast.success('Item deleted successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-8">
      <Toaster />
      <div className="max-w-6xl mx-auto">
        <Card className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">CRUD Demo</h1>
              <p className="text-gray-600 mt-2">
                Manage items using all shadcn/ui components
              </p>
            </div>
            <Button
              onClick={() => handleOpen()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              + Add New Item
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Priority</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold">Notified</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No items found. Create one to get started!
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>
                        <Badge className={`capitalize ${getStatusColor(item.status)}`}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`capitalize ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.description}
                      </TableCell>
                      <TableCell>
                        <Checkbox checked={item.notified} disabled />
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(item.createdAt, 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpen(item)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <Card className="p-4 bg-blue-50">
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-blue-600">{items.length}</p>
            </Card>
            <Card className="p-4 bg-green-50">
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {items.filter((i) => i.status === 'active').length}
              </p>
            </Card>
            <Card className="p-4 bg-yellow-50">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {items.filter((i) => i.status === 'pending').length}
              </p>
            </Card>
          </div>
        </Card>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Item' : 'Create New Item'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the item details below'
                : 'Fill in the details to create a new item'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Name *
              </Label>
              <Input
                id="name"
                placeholder="Enter item name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="border-gray-300"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="border-gray-300"
              />
            </div>

            {/* Status Select */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-semibold">
                Status
              </Label>
              <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'pending') =>
                setFormData({ ...formData, status: value })
              }>
                <SelectTrigger id="status" className="border-gray-300">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Select */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-semibold">
                Priority
              </Label>
              <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') =>
                setFormData({ ...formData, priority: value })
              }>
                <SelectTrigger id="priority" className="border-gray-300">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description Textarea */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter item description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="border-gray-300 resize-none"
                rows={4}
              />
            </div>

            {/* Date Picker with Calendar */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Created Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left border-gray-300">
                    {selectedDate
                      ? format(selectedDate, 'PPP')
                      : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Notification Switch */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Send Notification</Label>
                <p className="text-xs text-gray-500">
                  Notify user about this item
                </p>
              </div>
              <Switch
                checked={formData.notified}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, notified: checked })
                }
              />
            </div>
          </div>

          {/* Dialog Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {editingId ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
